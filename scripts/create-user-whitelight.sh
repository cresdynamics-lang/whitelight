#!/bin/bash
# Create user whitelight with password Ibrahim@254Admin
# Run as root or with sudo

set -e

USERNAME="whitelight"
PASSWORD="Ibrahim@254Admin"

echo "👤 Creating user: $USERNAME"

# Create user with home directory
useradd -m -s /bin/bash "$USERNAME"

# Set password
echo "$USERNAME:$PASSWORD" | chpasswd

# Add to sudo group (optional, for admin tasks)
usermod -aG sudo "$USERNAME"

# Create .ssh directory
mkdir -p "/home/$USERNAME/.ssh"
chmod 700 "/home/$USERNAME/.ssh"
chown -R "$USERNAME:$USERNAME" "/home/$USERNAME/.ssh"

echo "✅ User $USERNAME created successfully"
echo "📁 Home directory: /home/$USERNAME"
echo "🔑 Password: $PASSWORD"
