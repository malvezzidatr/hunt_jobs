#!/bin/bash
# ==============================================================================
# Hunt Jobs - Oracle Cloud VM Setup Script
# Run this script on a fresh Ubuntu 22.04 VM
# ==============================================================================

set -e

echo "========================================"
echo "Hunt Jobs - VM Setup"
echo "========================================"

# Update system
echo ">>> Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo ">>> Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Git
echo ">>> Installing Git..."
sudo apt install -y git

# Create app directory
echo ">>> Creating app directory..."
sudo mkdir -p /opt/hunt-jobs
sudo chown $USER:$USER /opt/hunt-jobs

# Clone repository (user needs to configure this)
echo ">>> Clone your repository:"
echo "    cd /opt/hunt-jobs"
echo "    git clone https://github.com/YOUR_USERNAME/hunt-jobs.git ."

# Open firewall ports
echo ">>> Configuring firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save

echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Log out and log back in (for docker group)"
echo "2. Clone your repository to /opt/hunt-jobs"
echo "3. Create .env file with your API keys"
echo "4. Run: docker compose up -d"
echo ""
echo "Optional: Install Nginx for reverse proxy"
echo "    sudo apt install -y nginx"
echo "    sudo cp deploy/nginx-proxy.conf /etc/nginx/sites-available/hunt-jobs"
echo "    sudo ln -s /etc/nginx/sites-available/hunt-jobs /etc/nginx/sites-enabled/"
echo "    sudo nginx -t && sudo systemctl reload nginx"
