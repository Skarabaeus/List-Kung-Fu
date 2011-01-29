xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'tag.html' ) )
  xml.JSON @tag.to_json
  get_validation_errors xml, @tag
end