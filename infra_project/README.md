# Integrated Infrastructure Automation Project Report

## 1. Project Topic & Problem Statement
**Topic:** *Automated Deployment and Monitoring of a Self‑Hosted GitLab Instance on AWS*  
**Problem:** Small‑to‑medium teams often need a private Git repository with CI/CD capabilities. Deploying GitLab manually involves provisioning an EC2 instance, installing dependencies, configuring the service, and setting up monitoring. The process is error‑prone, hard to reproduce, and difficult to maintain across environments.

## 2. Solution Overview
The solution uses **Terraform** to provision the AWS infrastructure (VPC, subnet, security groups, EC2 instance). **Ansible** configures the instance (Docker, GitLab Docker container, firewall). **Puppet** manages the ongoing configuration of the GitLab container (ensuring the correct image version, applying custom config files). **Nagios** monitors the host and GitLab service (HTTP check, CPU, disk). The workflow demonstrates a full end‑to‑end IaC + configuration‑management + monitoring pipeline.

## 3. Architecture Diagram
> *Insert architecture diagram here (e.g., Terraform → AWS → EC2 → Docker → GitLab; Ansible → provision; Puppet → enforce; Nagios → monitor)*

## 4. Terraform – Infrastructure as Code
**File:** `infra_project/terraform/main.tf`
```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" { default = "us-east-1" }
variable "instance_type" { default = "t3.medium" }
variable "key_name" { description = "EC2 key pair name" }

resource "aws_vpc" "gitlab_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "gitlab-vpc" }
}

resource "aws_subnet" "gitlab_subnet" {
  vpc_id            = aws_vpc.gitlab_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  tags = { Name = "gitlab-subnet" }
}

resource "aws_security_group" "gitlab_sg" {
  name        = "gitlab-sg"
  description = "Allow SSH, HTTP, HTTPS"
  vpc_id      = aws_vpc.gitlab_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "gitlab" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.gitlab_subnet.id
  vpc_security_group_ids = [aws_security_group.gitlab_sg.id]
  key_name      = var.key_name

  tags = { Name = "gitlab-server" }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}
```
*Explanation:* The VPC, subnet, security group, and EC2 instance are defined. Terraform state is stored locally (or can be configured for remote backend).

## 5. Ansible – Provisioning Playbook
**File:** `infra_project/ansible/playbook.yml`
```yaml
- name: Configure GitLab host
  hosts: gitlab
  become: true
  vars:
    gitlab_image: "gitlab/gitlab-ee:16.9.0-ee"
    gitlab_root_password: "SuperSecretRootPass"
  tasks:
    - name: Install Docker
      apt:
        name: docker.io
        state: present
        update_cache: yes

    - name: Ensure Docker service is running
      service:
        name: docker
        state: started
        enabled: true

    - name: Pull GitLab Docker image
      docker_image:
        name: "{{ gitlab_image }}"
        source: pull

    - name: Run GitLab container
      docker_container:
        name: gitlab
        image: "{{ gitlab_image }}"
        state: started
        restart_policy: always
        ports:
          - "80:80"
          - "443:443"
          - "22:22"
        env:
          GITLAB_OMNIBUS_CONFIG: |
            external_url 'http://{{ ansible_host }}'
            gitlab_rails['initial_root_password'] = "{{ gitlab_root_password }}"
```
**Inventory:** `infra_project/ansible/inventory.ini`
```ini
[gitlab]
{{ host_ip }} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```
*Explanation:* Ansible installs Docker, pulls the GitLab image, and runs the container with required ports and initial root password.

## 6. Puppet – Ongoing Configuration Management
**File:** `infra_project/puppet/manifests/site.pp`
```puppet
node default {
  # Ensure the GitLab container is always at the desired version
  docker::image { 'gitlab/gitlab-ee':
    ensure => present,
    tag    => '16.9.0-ee',
  }

  docker::run { 'gitlab':
    image   => 'gitlab/gitlab-ee:16.9.0-ee',
    ports   => ['80:80', '443:443', '22:22'],
    env     => [
      "GITLAB_OMNIBUS_CONFIG=external_url 'http://${facts[networking][fqdn]}'",
      "GITLAB_OMNIBUS_CONFIG=gitlab_rails['initial_root_password'] = 'SuperSecretRootPass'",
    ],
    restart => 'always',
    require => Docker::Image['gitlab/gitlab-ee'],
  }
}
```
*Explanation:* Puppet ensures the Docker image stays at the specified version and re‑creates the container if drift occurs.

## 7. Nagios – Monitoring Configuration
**File:** `infra_project/nagios/objects/localhost.cfg`
```cfg
define host {
    use                     linux-server
    host_name               gitlab-host
    alias                   GitLab EC2 Instance
    address                 {{ host_ip }}
}

define service {
    use                     generic-service
    host_name               gitlab-host
    service_description     HTTP
    check_command           check_http
    check_interval          5
}

define service {
    use                     generic-service
    host_name               gitlab-host
    service_description     CPU Load
    check_command           check_nrpe!check_load
    check_interval          5
}
```
*Explanation:* Nagios monitors HTTP availability of GitLab and basic host metrics via NRPE.

## 8. End‑to‑End Workflow
1. **Terraform apply** – Provisions AWS resources and outputs the EC2 public IP.
2. **Ansible playbook** – Uses the IP from step 1 to configure the host (Docker + GitLab).
3. **Puppet agent** – Runs on the instance (via cron or systemd) to enforce the container state.
4. **Nagios** – A central Nagios server (outside of AWS) monitors the instance using the public IP.

### Automation Script (optional)
```bash
#!/usr/bin/env bash
set -e
# 1. Terraform
terraform -chdir=infra_project/terraform init
terraform -chdir=infra_project/terraform apply -auto-approve
HOST_IP=$(terraform -chdir=infra_project/terraform output -raw instance_ip)
# 2. Ansible
sed -i "s/{{ host_ip }}/$HOST_IP/" infra_project/ansible/inventory.ini
ansible-playbook -i infra_project/ansible/inventory.ini infra_project/ansible/playbook.yml
# 3. Puppet (trigger a run)
ssh -i ~/.ssh/id_rsa ubuntu@$HOST_IP "sudo puppet apply /etc/puppetlabs/code/environments/production/manifests/site.pp"
# 4. Nagios – copy config and reload (assumes Nagios server reachable)
scp infra_project/nagios/objects/localhost.cfg nagios_user@nagios-server:/usr/local/nagios/etc/objects/gitlab.cfg
ssh nagios_user@nagios-server "sudo systemctl reload nagios"
```
*The script ties all tools together, demonstrating a reproducible pipeline.*

## 9. Evidence of Testing & Validation
| Step | Command | Expected Output | Screenshot (placeholder) |
|------|---------|----------------|--------------------------|
| Terraform plan | `terraform -chdir=infra_project/terraform plan` | Shows resources to be created | `![terraform_plan](assets/terraform_plan.png)` |
| Terraform apply | `terraform apply` | EC2 public IP printed | `![terraform_apply](assets/terraform_apply.png)` |
| Ansible run | `ansible-playbook -i inventory.ini playbook.yml` | Docker installed, container started | `![ansible_output](assets/ansible_output.png)` |
| Puppet apply | `puppet apply site.pp` | No changes or “Notice: Compiled catalog" | `![puppet_apply](assets/puppet_apply.png)` |
| Nagios check | Web UI shows **GitLab** host with **OK** HTTP service | `![nagios_dashboard](assets/nagios_dashboard.png)` |

## 10. Viva Demonstration Plan
1. **Show Terraform state** – `terraform show`.
2. **Run Ansible playbook live** – demonstrate idempotence.
3. **Trigger Puppet drift** (e.g., stop container) and show Puppet re‑creates it.
4. **Navigate Nagios UI** – highlight alerts and recovery.
5. **Discuss limitations** – e.g., single‑instance scaling, secret management.

---

*All configuration files are included in the `infra_project` directory. Replace placeholder IPs and secrets with your own values before execution.*
