class DefaultDto

  attr_reader :template, :data, :errors

  def initialize( args )


    if args.has_key?( :presenter )
      presenter = args[ :presenter ]
      @template = presenter.template
      @data = ActiveSupport::JSON.decode( presenter.json )
      @errors = false
    end

    if args.has_key?( :template ) and args.has_key?( :data )
      data = args[ :data ]
      if data.is_a? String
        @data = ActiveSupport::JSON.decode( data )
      else
        @data = data
      end
      @template = args[ :template ]

      if args.has_key?( :errors )
        @errors = args[ :errors ].length == 0 ? false : args[ :errors ]
      else
        @errors = false
      end

    end

  end

end