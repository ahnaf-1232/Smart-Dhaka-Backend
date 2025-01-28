provider "aws" {
  profile = "ahnaf"
  region = var.AWS_REGION

  default_tags {
    tags = var.AWS_DEFAULT_TAGS
  }
}

provider "random" {
  
}