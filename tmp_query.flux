from(bucket: "sensor_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "m_test")
  |> limit(n: 5)

docker exec -i lorawan_postgres pg_dump -U admin -d chirpstack -c > chirpstack_setari_complete.sql
