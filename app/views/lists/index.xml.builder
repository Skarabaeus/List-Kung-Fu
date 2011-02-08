xml.instruct!
xml.Response do
  xml.Template( render( :partial => 'list.html' ) )
  xml.JSON @lists.to_json( :methods => [ :tag_helper_color ],
    :include => { :tags => {
       :only => [ :id, :name ] }
      })
end