# BASE
AWS_REGION = "ap-south-1"
AWS_DEFAULT_TAGS = {
  Environment = "development"
  Project     = "smart-dhaka"
  Terraform   = true
  HandledBy   = "iit-du"
}
project_name = "smart-dhaka"
environment  = "development"

# VPC
vpc_cidr_block = "172.170.0.0/16"
public_subnets = [
  "172.170.1.0/24",
  "172.170.2.0/24",
  "172.170.3.0/24",
]
private_subnets = [
  "172.170.101.0/24",
  "172.170.102.0/24",
  "172.170.103.0/24",
]

# EKS
cluster_name_identifer     = "v1"
eks_version                = "1.31"
ami_type                   = "AL2_x86_64"
instance_types             = ["t3a.medium"]
instance_capacity_type     = "ON_DEMAND"
instance_storage_size      = 20
instance_storage_type      = "gp3"
scaling_desired_size       = 2
scaling_max_size           = 8
scaling_min_size           = 2

node_group_max_unavailable = 1

iam_access_entries = []

eks_addons = [
  {
    name    = "kube-proxy"
    version = "v1.31.0-eksbuild.5"
  },
  {
    name    = "vpc-cni"
    version = "v1.18.5-eksbuild.1"
  },
  {
    name    = "coredns"
    version = "v1.11.3-eksbuild.1"
  },
  {
    name    = "aws-ebs-csi-driver"
    version = "v1.35.0-eksbuild.1"
  },
  {
    name    = "aws-efs-csi-driver"
    version = "v2.0.7-eksbuild.1"
  }
]
eks_upgrade_support_policy = "STANDARD"

AWS_ACCESS_KEY_ID = "AKIAQR5EPMNDZ6XMXG42"
AWS_SECRET_ACCESS_KEY = "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"

# rds_name             = "bcf24-tm-rds-postgresql"
# engine_version       = "16.4"
# parameter_group_name = "default.postgres16"
# instance_class       = "db.t3.micro"
# publicly_accessible  = false
# allowed_cidr_blocks = [
#   "172.170.0.0/16",
#   "182.160.98.80/29",
#   "103.95.98.136/29",
#   "182.163.107.192/29",
#   "103.95.99.144/29",
#   "203.82.195.244/30",
#   "203.82.195.216/29",
#   "203.202.241.128/29",
#   "103.197.207.32/29"
# ]
# allocated_storage     = 20
# max_allocated_storage = 50

