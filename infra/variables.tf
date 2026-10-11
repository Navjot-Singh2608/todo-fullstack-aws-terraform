variable "region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ca-central-1"
}

variable "app_name" {
  description = "Name used for the Beanstalk app and related resources"
  type        = string
  default     = "todoapp"
}

variable "docker_user" {
  description = "Your Docker Hub username"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy (e.g. 1.0)"
  type        = string
  default     = "1.0"
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.micro"
}