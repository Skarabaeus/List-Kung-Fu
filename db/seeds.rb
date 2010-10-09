# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)


user = User.create(:email => 'siebel.stefan@gmail.com', :password => 'testtest')

100.times do |n|
  temp = List.new(:title => "Liste # #{n}")
  temp.owner = user
  temp.save!
end
  