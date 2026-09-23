# Smart Dhaka — Backend & DevOps Infrastructure

A containerized backend and AWS/Kubernetes deployment setup for a scalable railway ticket-management system developed for the **BUET DevOps Hackathon 2024** by **Ops Optimizers-DU**.

The repository contains both application services and the infrastructure/automation required to build, configure, and deploy them.

## What this repository demonstrates

- Microservice-oriented backend architecture
- Docker-based service packaging
- Amazon ECR image publishing
- Amazon EKS deployment
- Kubernetes manifests and Ingress
- Horizontal Pod Autoscaling (HPA)
- Terraform-based AWS infrastructure
- GitHub Actions CI/CD
- AWS Parameter Store integration for application settings
- Kubernetes secret management through CI/CD
- Code-quality and security checks
- SonarQube analysis
- Bandit security scanning
- Pylint quality checks
- Prometheus/Grafana-oriented monitoring setup
- Redis/ElastiCache-based caching
- Load-testing and scalability work

## Architecture

At a high level:

```text
                    GitHub
                       |
                       v
              GitHub Actions CI/CD
                       |
             +---------+---------+
             |                   |
             v                   v
        Build Docker       Quality/Security
          images              checks
             |
             v
       Amazon ECR
             |
             v
        Amazon EKS
             |
      +------+------+
      |             |
      v             v
 Map Service   Management Service
      |             |
      +------+------+
             |
       Application data
             |
     +-------+--------+
     |                |
     v                v
 PostgreSQL          Redis
    (RDS)          (cache)
```

The Kubernetes deployment also includes an NGINX Ingress controller exposed through an AWS network load balancer.

## Repository structure

Important areas of the repository include:

```text
.
├── .github/
│   ├── actions/
│   │   ├── build-and-push/
│   │   ├── deploy/
│   │   └── manage-secrets/
│   └── workflows/
│       ├── development_pipeline.yaml
│       └── development_test_pipeline.yaml
│
├── Smart-Dhaka-Terraform/
│   └── aws/
│       ├── environments/
│       └── modules/
│           ├── eks/
│           ├── rds_postgresql/
│           └── vpc/
│
├── deployment/
│   └── k8s/
│       └── menifests/
│
├── management/
│   ├── models/
│   ├── routes/
│   └── package.json
│
└── README.md
```

## AWS infrastructure

Terraform is organized into reusable modules.

### VPC

The development environment provisions a VPC with:

- public subnets
- private subnet configuration
- Internet Gateway
- NAT Gateway
- multiple Availability Zones

The configured development environment uses AWS region `ap-south-1`.

### Amazon EKS

The Terraform configuration provisions/configures an EKS cluster and its node group settings, including:

- Kubernetes version
- instance types
- node capacity type
- node storage
- desired/minimum/maximum scaling
- IAM access entries
- EKS add-ons
- security groups

### Amazon RDS PostgreSQL

The repository contains a reusable Terraform module for PostgreSQL RDS. The development environment currently has the RDS module commented out in `main.tf`, so it should be treated as infrastructure code available in the repository rather than an assertion that RDS is currently provisioned by that environment.

## CI/CD pipeline

The main development workflow runs on pushes to `main`.

The pipeline contains separate stages for services, including:

1. Checkout source
2. Build Docker image
3. Push image to Amazon ECR
4. Prepare application secrets
5. Deploy to the target EKS cluster
6. Update the corresponding Kubernetes deployment

The repository uses reusable local GitHub Actions:

- `.github/actions/build-and-push`
- `.github/actions/manage-secrets`
- `.github/actions/deploy`

Images are versioned using the CI/CD configuration and deployed to Kubernetes using the corresponding service manifests.

## Secrets and configuration

The CI/CD pipeline integrates with AWS configuration management and passes environment-specific values such as:

- AWS region
- ECR repository
- EKS cluster
- Kubernetes namespace
- service-specific Parameter Store paths

Secrets are handled through GitHub Actions secrets rather than being embedded directly in the workflow.

## Kubernetes

The `deployment/k8s/` directory contains Kubernetes deployment resources.

The repository includes configuration for:

- application services
- Kubernetes Services
- Ingress
- NGINX Ingress Controller
- AWS Load Balancer integration
- RBAC
- ServiceAccounts
- readiness/liveness probes
- rolling updates
- resource requests
- security contexts
- metrics-server resources

The NGINX Ingress controller is configured as an AWS LoadBalancer/NLB-facing component.

## Scaling and availability

The project uses Kubernetes-oriented scaling and availability mechanisms.

The documented architecture includes:

- Horizontal Pod Autoscaling
- rolling updates
- readiness probes
- liveness probes
- load balancing
- multiple EKS nodes
- resource-based scaling

These mechanisms are intended to allow the platform to respond to changing traffic while keeping healthy application instances available.

## Security and code quality

The repository contains a dedicated GitHub Actions workflow for automated quality/security checks.

It runs:

- **Bandit** for Python security analysis
- **Pylint** for Python code-quality checks
- **SonarQube** scanning

The workflow generates a report and can publish quality information back to pull requests.

## Monitoring and observability

The project documentation and deployment materials include a monitoring approach based on:

- Prometheus for metrics collection
- Grafana for visualization
- Kubernetes metrics-server resources

This provides the foundation for observing cluster/application resource usage and evaluating scaling behavior.

## Load testing

The project includes load-testing work for high request volume and documents the effect of increased traffic on cluster resource utilization.

Redis/ElastiCache is also used as a caching component in the documented architecture to reduce repeated data access and improve scalability.

## Local development

The backend contains Node.js services. For example, the management service uses:

- Node.js
- Express
- MongoDB/Mongoose
- JWT
- bcrypt
- Axios
- dotenv
- geolib

A service can be developed locally using its own `package.json` and Node.js scripts.

## Important files

| Path | Purpose |
|---|---|
| `.github/workflows/development_pipeline.yaml` | Build, secret-management and EKS deployment workflow |
| `.github/workflows/development_test_pipeline.yaml` | Security and code-quality pipeline |
| `.github/actions/build-and-push/` | Reusable Docker/ECR build action |
| `.github/actions/manage-secrets/` | Reusable secret/configuration action |
| `.github/actions/deploy/` | Reusable Kubernetes deployment action |
| `Smart-Dhaka-Terraform/aws/` | AWS infrastructure as code |
| `Smart-Dhaka-Terraform/aws/modules/eks/` | EKS infrastructure module |
| `Smart-Dhaka-Terraform/aws/modules/vpc/` | VPC infrastructure module |
| `Smart-Dhaka-Terraform/aws/modules/rds_postgresql/` | PostgreSQL RDS module |
| `deployment/k8s/` | Kubernetes deployment resources |
| `management/` | Management backend service |

## Technology stack

**Application**

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt

**Cloud & Infrastructure**

- AWS
- Amazon EKS
- Amazon ECR
- Amazon RDS
- Amazon ElastiCache/Redis
- VPC
- IAM

**DevOps**

- Docker
- Kubernetes
- Terraform
- GitHub Actions
- Bash/Shell

**Quality & Observability**

- SonarQube
- Bandit
- Pylint
- Prometheus
- Grafana

## DevOps highlights

This repository is particularly useful as a portfolio project because infrastructure is treated as part of the application rather than as a separate manual deployment step:

```text
Infrastructure
    ↓
Terraform
    ↓
AWS VPC + EKS
    ↓
Docker images
    ↓
Amazon ECR
    ↓
GitHub Actions
    ↓
Kubernetes deployment
    ↓
Ingress + Load Balancing
    ↓
Scaling + Monitoring
```

## Project context

**Project:** Railway Ticket Management System  
**Event:** BUET DevOps Hackathon 2024  
**Team:** Ops Optimizers-DU

The project was designed around handling high traffic for online railway-ticket purchasing while applying cloud-native deployment, automation, scaling, monitoring, and security practices.

## Repository status

This README describes the infrastructure and implementation currently present in the repository. Some infrastructure components exist as reusable modules but may be disabled/commented in a particular environment configuration; check the Terraform environment files before assuming a component is currently provisioned.

