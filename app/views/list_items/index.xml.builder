xml.instruct!
xml.Response do
  xml.Template( render( :partial => @presenter.template ) )
  xml.JSON @presenter.json
end