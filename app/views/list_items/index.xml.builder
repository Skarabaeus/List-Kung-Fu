xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'list_item.html' ) )
  xml.JSON @list_items.to_json( :include => :list )
end