xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'list.html' ) )
  xml.JSON @lists.to_json
end