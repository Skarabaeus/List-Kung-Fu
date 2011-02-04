xml.instruct!
xml.Response do
  xml.Template
  xml.JSON @list.to_json( :methods => [ :tag_helper_color ] )
  get_validation_errors xml, @list
end