EARLY_MORNING_CRON = 6

desc "This task is called by the Heroku cron add-on"
task :cron => :environment do
 # see documentation at http://docs.heroku.com/cron

 move_all_list_items_to_future

 #mail_dashboard_to_user
end

def mail_dashboard_to_user
  User.find_each( :batch_size => 100 ) do |user|

    Time.zone = user.time_zone

    # run 6am in the morning
    #if Time.zone.now.hour == EARLY_MORNING_CRON
    if user.email == 'siebel.stefan@gmail.com'

      dashboard_items = ListItem.all_scheduled_uncompleted( user.id )

      # only mail the user if he actually has any scheduled list items.
      if ( dashboard_items.count > 0 )
        ListItemMailer.dashboard( user, dashboard_items ).deliver
        puts "Mailed #{user.email} #{dashboard_items.count} list items"
      end
    end

  end
end

def move_all_list_items_to_future
  #ActiveRecord::Base.logger = Logger.new(STDOUT)


  ListItem.find_each( :batch_size => 100,
    :conditions => ["not deadline is ? and deadline < ?", nil, Time.zone.now],
    :include => [ :list => :owner ] ) do |list_item|

    # leave items with deadline "today" untouched
    # all items which should have been done before today, lets move them to tomorrow

    Time.zone = list_item.list.owner.time_zone

    # only change deadline 6am in the morning

    #if Time.zone.now.hour == EARLY_MORNING_CRON
      list_item.deadline = Time.zone.now.beginning_of_day + 12.hours
      if list_item.save
        puts "updated item #{list_item.id}"
      end
    #end

  end
end