xml.instruct!
xml.Response do
  xml.Template render( :partial => 'list_item_show.html' )
  xml.JSON @list_item.to_json( :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] )
  get_validation_errors xml, @list_item
end