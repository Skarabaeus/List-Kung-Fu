xml.instruct!
xml.Response do
  xml.Template
  xml.JSON @list.to_json( :methods => [ :tag_helper_color ],
    :include => { :tags => {
       :only => [ :id, :name ],
       :methods => [ :color_rgb, :foreground_color_rgb ] }
      })
  get_validation_errors xml, @list
end