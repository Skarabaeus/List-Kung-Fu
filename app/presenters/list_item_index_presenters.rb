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

    def last_updated_utc
      Time.now.utc
    end

    def json
      self.data.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ])
    end
  end

  class ListItemView
    def initialize( user_id, list_id, list_filter)
      @user_id = user_id
      @list_id = list_id
      @filter = list_filter

      case @filter
      when "all" # all of a specific list
        @data = ListItem.all_list( @user_id, @list_id )
      when "completed" # all completed of a specific list
        @data = ListItem.all_list_completed( @user_id, @list_id )
      else # all uncompleted of a specific list
        @data = ListItem.all_list_uncompleted( @user_id, @list_id )
      end
    end

    def template
      @template = 'list_item.html'
    end

    def data
      @data
    end

    def last_updated_utc
      Time.now.utc
    end

    def json
      self.data.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date, :body_word_count ],
        :except => [ :body ] )
    end
  end

end