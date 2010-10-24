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

end
