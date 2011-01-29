xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'form.html', :locals => { :tag => @tag } ) )
  xml.JSON @tag.to_json
  get_validation_errors xml, @tag
end