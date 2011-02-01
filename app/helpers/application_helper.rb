module ApplicationHelper

  def get_validation_errors( xml, model )
    xml.Errors do
      model.errors.keys.each do |field|
        model.errors[ field ].each do |err|
          xml.Error err, :model => model.class.to_s.downcase!, :field => field.to_s
        end
      end
    end
  end

  def use_minified_javascript?
    use_minified = true

    use_minified = false if Rails.env == 'development'
    use_minified = false if session['dev_javascript'] == true
    use_minified = true if session['dev_javascript'] == false

    use_minified
  end

end
