xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'list_item.html' ) )
  xml.JSON @list_items.to_json( :include => :list,
    :methods => [ :deadline_category, :deadline_in_words, :body_rendered ],
    :except => [ :body, :deadline ] )
end