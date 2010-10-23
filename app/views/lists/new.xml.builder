xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'form.html', :locals => { :list => @list } ) )
  xml.JSON @list.to_json
end