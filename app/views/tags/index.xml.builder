xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'tag.html' ) )
  xml.JSON @tags.to_json
end