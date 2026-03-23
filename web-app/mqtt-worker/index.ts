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
mqttClient.on('message', (topic: string, message: Buffer) => {
    try {
        const payload = JSON.parse(message.toString());
        
        const devEui = payload.deviceInfo?.devEui;
        const decodedData = payload.object;

        if (devEui && decodedData) {
            console.log(`📥 Date primite de la ${devEui}:`, decodedData);

            const point = new Point('meter_reading')
                .tag('devEui', devEui);
                
            if (decodedData.energy !== undefined) point.floatField('energy', decodedData.energy);
            if (decodedData.voltage !== undefined) point.floatField('voltage', decodedData.voltage);
            if (decodedData.current !== undefined) point.floatField('current', decodedData.current);

            writeApi.writePoint(point);
            
            writeApi.flush()
                .then(() => console.log(`💾 Salvat în InfluxDB pentru ${devEui}`))
                .catch((err: any) => console.error('❌ Eroare la scriere InfluxDB:', err));
        }
    } catch (error: any) {
        console.error('❌ Eroare la procesarea pachetului MQTT:', error);
    }
});

process.on('SIGINT', async () => {
    console.log('Oprire worker...');
    await writeApi.close();
    mqttClient.end();
    process.exit(0);
});