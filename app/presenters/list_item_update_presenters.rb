module ListItemUpdatePresenters

  class Dashboard
    def initialize( list_item )
      @list_item = list_item
    end

    def template
      @template = 'list_item_dashboard.html'
    end

    def data
      @data = @list_item
    end
  end

  class ListItemView
    def initialize( list_item )
      @list_item = list_item
    end

    def template
      @template = 'list_item.html'
    end

    def data
      @data = @list_item
    end
  end

end