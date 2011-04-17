module ListItemUpdatePresenters

  class Dashboard
    def initialize( list_item )
      @data = list_item
    end

    def template
      @template = 'list_items-list_item_dashboard'
    end

    def json
      @data.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] )
    end
  end

  class ListItemView
    def initialize( list_item )
      @data = list_item
    end

    def json
      @data.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] )
    end

    def template
      @template = 'list_items-list_item'
    end
  end

end