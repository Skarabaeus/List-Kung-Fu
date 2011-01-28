class ListItemMailer < ActionMailer::Base
  default :from => "todo@listkungfu.com"

  def dashboard( user, list_items )
      Time.zone = user.time_zone
      @list_items = list_items
      mail(:to => user.email,
           :subject => "Your Todo List for #{Time.zone.now.strftime('%Y-%m-%d')}")
    end
end
