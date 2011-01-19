module ListItemsHelper

  def get_deadline( list_item )
    html = StringIO.new

    html << list_item.deadline_in_words

    if !list_item.deadline.nil? and list_item.deadline.strftime('%Y-%m-%d') != list_item.deadline_in_words
  	  html << '<br />' << list_item.deadline.strftime('%Y-%m-%d')
  	end
  	html.string.html_safe
  end

end