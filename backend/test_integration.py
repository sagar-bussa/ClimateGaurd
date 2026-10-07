import httpx

def main():
    print("Testing ClimateGuard AI Services...")
    with httpx.Client(timeout=10.0) as client:
        # 1. Health
        h = client.get("http://127.0.0.1:8000/api/health")
        print(f"Health [{h.status_code}]:", h.json())

        # 2. Environment Summary (Hyderabad)
        s = client.get("http://127.0.0.1:8000/api/environment/summary?lat=17.3850&lon=78.4867&name=Hyderabad")
        s_data = s.json()
        print(f"Summary [{s.status_code}]: Location={s_data['location']['name']}, Temp={s_data['current_conditions']['temperature_c']}C, PM2.5={s_data['air_quality']['pm25']}, RiskScore={s_data['risk']['risk_score']}, Confidence={s_data['verification']['overall_confidence_score']}%, Status={s_data['verification']['verification_status']}")

        # 3. Location Search
        l = client.get("http://127.0.0.1:8000/api/location/search?q=London")
        print(f"Location Search [{l.status_code}]: Found {len(l.json())} results for London")

        # 4. Assistant Chat
        chat = client.post("http://127.0.0.1:8000/api/assistant/chat", json={
            "message": "Is the weather safe for outdoor activities?",
            "context_data": s_data
        })
        print(f"Assistant [{chat.status_code}]:", chat.json()["reply"])

        # 5. Frontend UI
        fe = client.get("http://localhost:5174/")
        print(f"Frontend UI [{fe.status_code}]: Length={len(fe.text)} bytes")

if __name__ == "__main__":
    main()
