# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
ListKungFu::Application.initialize!

#ActionMailer::Base.smtp_settings = {
#  :enable_starttls_auto => true,
#  :address        => 'smtp.gmail.com',
#  :port           => 587,
#  :domain         => 'listkungfu.com',
#  :authentication => :plain,
#  :user_name      => 'registration@listkungfu.com',
#  :password       => ENV['REGISTRATION_PASSWORD']
#}
