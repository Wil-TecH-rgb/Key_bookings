# KeyBooking Web Application

A cloud-native web application deployed on AWS infrastructure, featuring a split architecture with an independent compute layer and a managed database system. This project was built and deployed as part of a cloud deployment assignment portfolio.

## Architecture Overview

The application utilizes a secure, scalable, and isolated architecture within the AWS cloud ecosystem:

*   *Compute Layer:* Hosted on an Amazon EC2 instance running Amazon Linux 2023.
*   *Database Layer:* Managed via Amazon RDS running a Free-Tier compliant engine (MySQL/PostgreSQL), isolated securely from direct public access.
*   *Networking & Security:* Implements custom AWS Security Groups enforcing the principle of least privilege. Compute nodes accept incoming public web traffic via HTTP (Port 80) and secure administrative traffic via SSH (Port 22).

## Deployment Steps

### 1. Database Provisioning (Amazon RDS)
*   Launched a managed DB instance under the AWS Free Tier template.
*   Configured database storage limits within the 20 GB baseline to avoid unexpected billing.
*   Disabled storage autoscaling to maintain complete cost control.

### 2. Network Security Configurations
*   *EC2 Security Group:* Configured inbound network firewall rules to explicitly allow standard web traffic (HTTP on Port 80) and administrative access (SSH on Port 22).
*   *RDS Security Group:* Restricted inbound database access explicitly to traffic originating from the EC2 instance's security group, blocking external public access.

### 3. Server Setup & Application Deployment
*   Provisioned an Amazon EC2 instance (t3.micro / t4g.micro).
*   Connected securely over SSH using a private key file (.pem).
*   Installed core platform dependencies, runtime packages, and production process managers.
*   Synchronized deployment artifacts directly using source control via GitHub.

## Local Development & Installation

To run this project locally, clone the repository and configure your local environment:

bash
# Clone the repository
git clone https://github.com

# Navigate into the project directory
cd NEW_REPO_NAME

# Install dependencies
npm install  # (or pip install -r requirements.txt for Python backends)


### Environment Configuration
Create a local .env configuration file in the root directory to store your runtime environment variables:

env
DB_HOST=your-rds-endpoint-string
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
PORT=80


##  Assignment Requirements Met
Separation of concerns using independent compute (EC2) and database (RDS) infrastructure.
Secured networking rules using restrictive AWS Security Groups.
Source code control deployment tracking utilizing GitHub.
