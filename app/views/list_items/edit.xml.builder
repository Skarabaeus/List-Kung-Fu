xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'form.html', :locals => { :list_item => @list_item } ) )
  xml.JSON @list_item.to_json
  get_validation_errors xml, @list_item
end