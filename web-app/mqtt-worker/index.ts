import * as mqtt from 'mqtt';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import * as dotenv from 'dotenv';

// Încărcăm variabilele de mediu
dotenv.config();

const INFLUX_URL = process.env.INFLUX_URL || '';
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || '';
const INFLUX_ORG = process.env.INFLUX_ORG || '';
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || '';
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

type DecodedUplinkObject = {
    energy?: number;
    voltage?: number;
    current?: number;
    consum_total_kWh?: number;
    tensiune_V?: number;
    curent_A?: number;
    [key: string]: unknown;
};

type ChirpStackUplinkPayload = {
    deviceInfo?: {
        devEui?: string;
    };
    object?: DecodedUplinkObject;
};

function toFiniteNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

// 1. Inițializăm clientul InfluxDB
const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');

// 2. Ne conectăm la brokerul MQTT
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
    console.log('✅ Conectat la brokerul MQTT cu succes!');
    
    const topic = 'application/+/device/+/event/up';
    
    // Am adăugat tipul (Error | null) pentru parametrul err
    mqttClient.subscribe(topic, (err: Error | null) => {
        if (!err) {
            console.log(`📡 Abonat la topicul: ${topic}`);
        } else {
            console.error('❌ Eroare la abonare MQTT:', err);
        }
    });
});

// 3. Procesăm mesajele primite
// Am adăugat tipurile: topic este string, iar message este de tip Buffer
mqttClient.on('message', (_topic: string, message: Buffer) => {
    try {
        const payload = JSON.parse(message.toString()) as ChirpStackUplinkPayload;
        
        const devEui = payload.deviceInfo?.devEui;
        const decodedData = payload.object;

        if (devEui && decodedData) {
            console.log(`📥 Date primite de la ${devEui}:`, decodedData);

            // Accept both generic keys and profile-specific Romanian keys from ChirpStack payload codec.
            const energy = toFiniteNumber(decodedData.energy ?? decodedData.consum_total_kWh);
            const voltage = toFiniteNumber(decodedData.voltage ?? decodedData.tensiune_V);
            const current = toFiniteNumber(decodedData.current ?? decodedData.curent_A);

            if (energy === null && voltage === null && current === null) {
                console.warn(`⚠️ Niciun camp numeric mapat pentru ${devEui}. Payload ignorat.`);
                return;
            }

            const point = new Point('meter_reading')
                .tag('devEui', devEui);
                
            if (energy !== null) point.floatField('energy', energy);
            if (voltage !== null) point.floatField('voltage', voltage);
            if (current !== null) point.floatField('current', current);

            writeApi.writePoint(point);
            
            writeApi.flush()
                .then(() => console.log(`💾 Salvat în InfluxDB pentru ${devEui}`))
                .catch((err: unknown) => console.error('❌ Eroare la scriere InfluxDB:', err));
        }
    } catch (error: unknown) {
        console.error('❌ Eroare la procesarea pachetului MQTT:', error);
    }
});

process.on('SIGINT', async () => {
    console.log('Oprire worker...');
    await writeApi.close();
    mqttClient.end();
    process.exit(0);
});