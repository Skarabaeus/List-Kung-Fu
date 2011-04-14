module ApplicationHelper

  def use_minified_javascript?
    use_minified = true

    use_minified = false if Rails.env == 'development'
    use_minified = false if session['dev_javascript'] == true
    use_minified = true if session['dev_javascript'] == false

    use_minified
  end

end
