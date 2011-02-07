module ListItemIndexPresenters

  class Dashboard
    def initialize( user_id )
      @user_id = user_id
    end

    def template
      @template = 'list_item_dashboard.html'
    end

    def data
      @data = ListItem.all_scheduled_uncompleted( @user_id )
    end
  end

  class ListItemView
    def initialize( user_id, list_id, list_filter)
      @user_id = user_id
      @list_id = list_id
      @filter = list_filter
    end

    def template
      @template = 'list_item.html'
    end

    def data
      case @filter
      when "all" # all of a specific list
        @data = ListItem.all_list( @user_id, @list_id )
      when "completed" # all completed of a specific list
        @data = ListItem.all_list_completed( @user_id, @list_id )
      else # all uncompleted of a specific list
        @data = ListItem.all_list_uncompleted( @user_id, @list_id )
      end
    end
  end

end