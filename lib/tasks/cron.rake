desc "This task is called by the Heroku cron add-on"
task :cron => :environment do
 # see documentation at http://docs.heroku.com/cron
 
 move_all_list_items_to_future
end

def move_all_list_items_to_future

  #ActiveRecord::Base.logger = Logger.new(STDOUT)
      

  ListItem.find_each( :batch_size => 100, 
    :conditions => ["not deadline is ? and deadline < ?", nil, Time.zone.now],
    :include => [ :list => :owner ] ) do |list_item|

    # leave items with deadline "today" untouched
    # all items which should have been done before today, lets move them to tomorrow

    Time.zone = list_item.list.owner.time_zone
    list_item.deadline = Time.zone.now.tomorrow.beginning_of_day + 12.hours
    if list_item.save
      puts "updated item #{list_item.id}"
    end
    
  end
end