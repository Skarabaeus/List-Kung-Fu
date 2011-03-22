
desc "Convert all list item bodies from textile into html"
task :convertbody => :environment do
  
  ListItem.find_each( :batch_size => 100 ) do |item|
    puts "Trying to update #{item.id}"
    html = item.body.nil? ? '' : RedCloth.new( item.body ).to_html
    
    item.body = html
    item.save
    
    puts "Updated item #{item.id}"
  end

end
