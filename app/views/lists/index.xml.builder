xml.instruct!
xml.Response do
  xml.Template "<strong>Test</strong>"
  xml.JSON @lists.to_json
end