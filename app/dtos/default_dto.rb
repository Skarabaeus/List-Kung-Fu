class DefaultDto
  
  attr_reader :template, :data, :errors
  
  def initialize( template, data, errors )
    @data = data
    @errors = errors
  end
  
  def initialize( presenter )
    @template = presenter.template
    @data = presenter.json
    @errors = nil    
  end
  
end