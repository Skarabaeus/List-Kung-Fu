xml.instruct!
xml.Response do
  xml.Template( render( :partial => @presenter.template ) )
  xml.JSON @presenter.data.to_json( :include => :list,
    :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ])
end