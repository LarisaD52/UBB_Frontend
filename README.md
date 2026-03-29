# 🤖 (SentoAI)

# Frontend

`/SentoAI_Frontend`

Install dependencies: `npm install --legacy-peer-deps`

Run: `npx expo start`

# Backend

`/SentoAI_Backend`

Install dependencies: `pip install -r requirements.txt`

Run: `uvicorn main:app`

Custom IP + port (append to the run command): `--host CUSTOM_IP --port CUSTOM_PORT`

# Running on web (local machine)

- start the frontend
- look for the line: `Web is waiting on://localhost:LOCAL_PORT`
- start the backend without custom ip, eventually with custom port `BE_PORT`
- update the variable `API_BASE_URL` from `/SentoAI_Frontend/config.ts` with `localhost:BE_PORT`

# Running on mobile (Expo go)

- start the frontend
- look for the line: `Metro waiting on exp://NETWORK_IP:FE_PORT`
- start the backend using `NETWORK_IP` as custom ip, and eventually `BE_PORT` as custom port
- update the variable `API_BASE_URL` from `/SentoAI_Frontend/config.ts` with `NETWORK_IP:BE_PORT`
