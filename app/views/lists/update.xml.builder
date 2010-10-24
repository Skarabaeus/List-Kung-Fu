xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'list.html' ) )
  xml.JSON @list.to_json
end