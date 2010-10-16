module ApplicationHelper
  
  def js( str )
    escape_javascript ( str.html_safe )
  end 
  
end
