class ListItemMailer < ActionMailer::Base
  default :from => "todo@listkungfu.com"
  
  def dashboard( user, list_items )
      @list_items = list_items
      mail(:to => user.email,
           :subject => "Welcome to My Awesome Site")
    end
end
