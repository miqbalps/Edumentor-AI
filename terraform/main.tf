terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# ==========================================
# INPUT VARIABLES
# ==========================================

# 1. AWS Configuration Variables
variable "aws_region" {
  type        = string
  description = "AWS region to deploy all resources"
  default     = "ap-southeast-2"
}

variable "aws_access_key" {
  type        = string
  description = "AWS Access Key ID"
  default     = ""
}

variable "aws_secret_key" {
  type        = string
  description = "AWS Secret Access Key"
  default     = ""
}

variable "aws_session_token" {
  type        = string
  description = "AWS Session Token (Required for AWS Academy/Sandbox)"
  default     = ""
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the primary VPC"
  default     = "10.0.0.0/16"
}

variable "frontend_subnet_cidr" {
  type        = string
  description = "CIDR block for the public frontend subnet"
  default     = "10.0.1.0/24"
}

variable "backend_subnet_cidr" {
  type        = string
  description = "CIDR block for the private backend subnet"
  default     = "10.0.2.0/24"
}

variable "db_subnet_a_cidr" {
  type        = string
  description = "CIDR block for the private database subnet A"
  default     = "10.0.3.0/24"
}

variable "db_subnet_b_cidr" {
  type        = string
  description = "CIDR block for the private database subnet B"
  default     = "10.0.4.0/24"
}

variable "vm_instance_type" {
  type        = string
  description = "AWS EC2 instance class for compute instances"
  default     = "t3.micro"
}

variable "ssh_key_name" {
  type        = string
  description = "The name of the AWS EC2 Key Pair to associate with the instances"
  default     = ""
}

# 2. Database Variables
variable "db_name" {
  type        = string
  description = "Default database schema name"
  default     = "edumentor"
}

variable "db_user" {
  type        = string
  description = "Master username for RDS MySQL database"
  default     = "root"
}

variable "db_password" {
  type        = string
  description = "Master database password (Sensitive)"
  sensitive   = true
}

variable "db_instance_class" {
  type        = string
  description = "Instance type for the RDS MySQL database"
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  type        = number
  description = "Allocated storage size for RDS in Gigabytes"
  default     = 20
}

# 3. Cloudflare Configuration Variables
variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token with DNS & R2 privileges"
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare Account ID"
}

variable "cloudflare_zone_name" {
  type        = string
  description = "The registered root domain name in Cloudflare (e.g. edumentor.ai)"
  default     = ""
}

variable "app_domain" {
  type        = string
  description = "Primary domain for the frontend application (e.g. edumentor.ai)"
  default     = ""
}

variable "storage_domain" {
  type        = string
  description = "Subdomain to access R2 bucket assets through CDN (e.g. materials.edumentor.ai)"
  default     = ""
}

# ==========================================
# PROVIDERS CONFIGURATION (MULTI-CLOUD)
# ==========================================

# 1. AWS Provider (Layanan Utama: Compute, VPC, DB RDS)
provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key != "" ? var.aws_access_key : null
  secret_key = var.aws_secret_key != "" ? var.aws_secret_key : null
  token      = var.aws_session_token != "" ? var.aws_session_token : null
}

# 2. Cloudflare Provider (Layanan Storage R2 & CDN)
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ==========================================
# CLOUDFLARE DATA SOURCE: LOOKUP ZONE ID
# ==========================================
data "cloudflare_zone" "main_zone" {
  count = var.cloudflare_zone_name != "" ? 1 : 0
  name  = var.cloudflare_zone_name
}

# ==========================================
# DATA SOURCE: LATEST UBUNTU 22.04 LTS AMI
# ==========================================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ==========================================
# AWS NETWORK ARCHITECTURE: SEGMENTED VPC
# ==========================================

# Main VPC
resource "aws_vpc" "main_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "edumentor-vpc"
  }
}

# Internet Gateway (Untuk akses publik ke Frontend Subnet)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "edumentor-igw"
  }
}

# Subnets
# 1. Frontend Subnet (Public)
resource "aws_subnet" "frontend_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = var.frontend_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "frontend-subnet"
  }
}

# 2. Backend Subnet (Private)
resource "aws_subnet" "backend_subnet" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = var.backend_subnet_cidr
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "backend-subnet"
  }
}

# 3. Database Subnet A (Private)
resource "aws_subnet" "db_subnet_a" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = var.db_subnet_a_cidr
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "db-subnet-a"
  }
}

# 4. Database Subnet B (Private - Diperlukan oleh RDS Subnet Group untuk Multi-AZ)
resource "aws_subnet" "db_subnet_b" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = var.db_subnet_b_cidr
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "db-subnet-b"
  }
}

# ==========================================
# AWS NAT GATEWAY (Untuk Internet Akses Private Subnet Backend)
# ==========================================

# Elastic IP untuk NAT Gateway
resource "aws_eip" "nat_eip" {
  domain = "vpc"
  tags = {
    Name = "edumentor-nat-eip"
  }
}

# NAT Gateway (Ditempatkan di Public Subnet Frontend)
resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.frontend_subnet.id

  tags = {
    Name = "edumentor-nat-gw"
  }

  depends_on = [aws_internet_gateway.igw]
}

# ==========================================
# ROUTE TABLES & ASSOCIATIONS
# ==========================================

# 1. Public Route Table (Frontend) -> Menuju Internet Gateway
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "frontend-public-rt"
  }
}

resource "aws_route_table_association" "frontend_assoc" {
  subnet_id      = aws_subnet.frontend_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 2. Private Route Table (Backend) -> Menuju NAT Gateway
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "backend-private-rt"
  }
}

resource "aws_route_table_association" "backend_assoc" {
  subnet_id      = aws_subnet.backend_subnet.id
  route_table_id = aws_route_table.private_rt.id
}

# ==========================================
# AWS SECURITY: SECURITY GROUPS (FIREWALL)
# ==========================================

# 1. Frontend Security Group (Bisa diakses publik port 80/8080)
resource "aws_security_group" "frontend_sg" {
  name        = "frontend-sg"
  description = "Allow HTTP inbound traffic for Frontend"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description = "HTTP Web Access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Vite Dev Access"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "frontend-sg"
  }
}

# 2. Backend Security Group (Hanya menerima traffic dari Frontend SG port 5000)
resource "aws_security_group" "backend_sg" {
  name        = "backend-sg"
  description = "Allow port 5000 from Frontend VM only"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description     = "Backend API from Frontend"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend_sg.id]
  }

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "backend-sg"
  }
}

# 3. Database Security Group (Hanya menerima traffic dari Backend SG port 3306)
resource "aws_security_group" "db_sg" {
  name        = "database-sg"
  description = "Allow MySQL port 3306 from Backend VM only"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    description     = "MySQL Access from Backend"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "database-sg"
  }
}

# ==========================================
# AWS COMPUTE: EC2 INSTANCES
# ==========================================

# 1. Frontend VM (React served by Nginx)
resource "aws_instance" "frontend_vm" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.vm_instance_type
  key_name               = var.ssh_key_name != "" ? var.ssh_key_name : null
  subnet_id              = aws_subnet.frontend_subnet.id
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io docker-compose-v2
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              sudo mkdir -p /var/www/edumentor-ai
              sudo chown -R ubuntu:ubuntu /var/www/edumentor-ai
              EOF

  tags = {
    Name = "edumentor-frontend-vm"
  }
}

# 2. Backend VM (Node.js API)
resource "aws_instance" "backend_vm" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.vm_instance_type
  key_name               = var.ssh_key_name != "" ? var.ssh_key_name : null
  subnet_id              = aws_subnet.backend_subnet.id
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io docker-compose-v2
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              sudo mkdir -p /var/www/edumentor-ai
              sudo chown -R ubuntu:ubuntu /var/www/edumentor-ai
              EOF

  tags = {
    Name = "edumentor-backend-vm"
  }
}

# ==========================================
# AWS DATABASE: RDS MYSQL INSTANCE
# ==========================================

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "edumentor-db-subnet-group"
  subnet_ids = [aws_subnet.db_subnet_a.id, aws_subnet.db_subnet_b.id]

  tags = {
    Name = "edumentor-rds-subnet-group"
  }
}

resource "aws_db_instance" "mysql_db" {
  allocated_storage      = var.db_allocated_storage
  db_name                = var.db_name
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true

  tags = {
    Name = "edumentor-mysql-db"
  }
}

# ==========================================
# CLOUDFLARE R2: MULTI-CLOUD STORAGE BUCKET
# ==========================================

resource "cloudflare_r2_bucket" "edumentor_bucket" {
  account_id = var.cloudflare_account_id
  name       = "edumentor-materials-bucket"
  location   = "APAC"
}

# ==========================================
# CLOUDFLARE CDN & DNS CONFIGURATIONS
# ==========================================

# 1. Cloudflare CDN & DNS untuk Frontend App
resource "cloudflare_record" "frontend_cdn_dns" {
  count   = var.cloudflare_zone_name != "" && var.app_domain != "" ? 1 : 0
  zone_id = data.cloudflare_zone.main_zone[0].id
  name    = var.app_domain
  value   = aws_instance.frontend_vm.public_ip
  type    = "A"
  proxied = true
}


