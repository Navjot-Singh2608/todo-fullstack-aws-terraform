############################################
# 1. S3: stores the deployment zip
#    (only docker-compose.yml goes here - Beanstalk requires it;
#     the app itself runs on EC2 from your Docker Hub images)
############################################
data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "versions" {
  # Bucket names are global, so include account ID + region to keep it unique
  bucket        = "${var.app_name}-eb-${data.aws_caller_identity.current.account_id}-${var.region}"
  force_destroy = true # lets "terraform destroy" remove it even if not empty
}

# Build the zip on your PC: fill in the template -> docker-compose.yml
data "archive_file" "bundle" {
  type        = "zip"
  output_path = "${path.module}/build/bundle.zip"

  source {
    content = templatefile("${path.module}/../deploy/docker-compose.yml.tftpl", {
      docker_user = var.docker_user
      image_tag   = var.image_tag
    })
    filename = "docker-compose.yml"
  }
}

locals {
  # Changes whenever the tag or compose file changes -> triggers a new deploy
  version_label = "${var.image_tag}-${substr(data.archive_file.bundle.output_md5, 0, 8)}"
}

# Upload the zip to S3
resource "aws_s3_object" "bundle" {
  bucket = aws_s3_bucket.versions.id
  key    = "${var.app_name}/${local.version_label}.zip"
  source = data.archive_file.bundle.output_path
  etag   = data.archive_file.bundle.output_md5

  lifecycle {
    create_before_destroy = true
  }
}

############################################
# 2. Elastic Beanstalk
############################################
# Latest "Docker on Amazon Linux 2023" platform
data "aws_elastic_beanstalk_solution_stack" "docker" {
  most_recent = true
  name_regex  = "^64bit Amazon Linux 2023 (.*) running Docker$"
}

resource "aws_elastic_beanstalk_application" "app" {
  name        = var.app_name
  description = "Todo app (React + FastAPI)"
}

# One application version = one deployable zip in S3
resource "aws_elastic_beanstalk_application_version" "v" {
  name        = local.version_label
  application = aws_elastic_beanstalk_application.app.name
  bucket      = aws_s3_bucket.versions.id
  key         = aws_s3_object.bundle.key

  lifecycle {
    create_before_destroy = true
  }
}

# The running environment (one EC2 server)
resource "aws_elastic_beanstalk_environment" "env" {
  name                = "${var.app_name}-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = data.aws_elastic_beanstalk_solution_stack.docker.name
  version_label       = aws_elastic_beanstalk_application_version.v.name

  # Single server, no load balancer (cheapest; fine for SQLite)
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.eb_service.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_ec2.name
  }

  # Needed on newer AWS accounts (launch templates + secure metadata)
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "DisableIMDSv1"
    value     = "true"
  }

  setting {
    namespace = "aws:ec2:instances"
    name      = "InstanceTypes"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "enhanced"
  }
}

############################################
# 3. Outputs
############################################
output "app_url" {
  value = "http://${aws_elastic_beanstalk_environment.env.cname}"
}

output "deployed_version" {
  value = aws_elastic_beanstalk_application_version.v.name
}
