xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'list_item.html' ) )
  xml.JSON @list_item.to_json
  get_validation_errors xml, @list_item
end