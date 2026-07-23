rm -rf dist
npm run build

# 100
scp -r dist/  guony@192.167.253.100:/data/guony/agentsys/

