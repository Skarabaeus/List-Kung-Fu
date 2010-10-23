xml.instruct!
xml.Response do
  xml.Template
  xml.JSON @list.to_json
end