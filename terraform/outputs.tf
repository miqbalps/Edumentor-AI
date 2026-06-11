# ==========================================
# TERRAFORM OUTPUTS
# ==========================================

output "frontend_public_ip" {
  description = "Public IP address of the frontend VM"
  value       = aws_instance.frontend_vm.public_ip
}

output "backend_private_ip" {
  description = "Private IP address of the backend VM (accessible via Frontend VM / NAT Gateway)"
  value       = aws_instance.backend_vm.private_ip
}

output "rds_endpoint" {
  description = "The endpoint of the RDS MySQL instance (host:port)"
  value       = aws_db_instance.mysql_db.endpoint
}

output "rds_hostname" {
  description = "The DNS host address of the RDS MySQL instance (for DB_HOST)"
  value       = aws_db_instance.mysql_db.address
}

output "rds_port" {
  description = "The connection port of the RDS MySQL instance (for DB_PORT)"
  value       = aws_db_instance.mysql_db.port
}

output "r2_bucket_name" {
  description = "The name of the created Cloudflare R2 bucket"
  value       = cloudflare_r2_bucket.edumentor_bucket.name
}
