class ListItemsController < ApplicationController

  before_filter :authenticate_user!
  before_filter :load_list, :except => :index

  respond_to :xml

  def index
    case params[ :show ]
    when "dashboard"
      @presenter = ListItemIndexPresenters::Dashboard.new( current_user.id )
    else
      @presenter = ListItemIndexPresenters::ListItemView.new( current_user.id, params[ :list_id ], params[ :show ] )
    end

    respond_with( @list_items )
  end

  def show
    @list_item = @list.list_items.find( params[ :id ] )
    respond_with(@list_item)
  end

  def new
    @list_item = ListItem.new
    @list_item.list_id = @list.id

    respond_with( @list_item ) do |format|
      format.js
    end
  end

  def edit
    @list_item = @list.list_items.find( params[ :id ] )


    respond_with( @list_item ) do |format|
      format.js
    end
  end

  def create
    @list_item = ListItem.new( params[ :list_item ] )
    @list_item.list_id = @list.id
    @list_item.deadline = get_deadline

    if @list_item.save
      flash[:notice] = 'List Item has been created.'
    end

    respond_with( @list_item )
  end

  def update
    @list_item = @list.list_items.find( params[ :id ] )

    @list_item.body = params[ :list_item ][ :body ]
    @list_item.completed = params[ :list_item ][ :completed ] unless params[ :list_item ][ :completed ].nil?
    @list_item.deadline = get_deadline

    if params[ :list_item ][ :template ] == 'dashboard'
      @presenter = ListItemUpdatePresenters::Dashboard.new( @list_item )
    else
      @presenter = ListItemUpdatePresenters::ListItemView.new( @list_item )
    end

    if @list_item.save
      flash[:notice] = 'List Item has been updated.'
    end

    respond_with( @list_item )
  end

  def destroy
    @list_item = @list.list_items.find( params[ :id ] )
    @list_item.destroy

    respond_with( @list_item )
  end

  private

  def load_list
    @list = current_user.lists.find( params[ :list_id ] )
  end

  def get_deadline
    case params[ :list_item ][ :deadlineType ]
    when 'today'
      Time.zone.now
    when 'tomorrow'
      (Time.zone.now + 1.day).beginning_of_day + 12.hours
    when 'nextweek'
      (Time.zone.now + 1.week).beginning_of_week + 12.hours
    when 'keepit'
      @list_item.deadline
    when 'customdeadline'
      date_arr = (params[ :list_item ][ :customDeadlineValue ]).split( ',' )
      # yy,mm,dd
      date = Time.local date_arr.first, date_arr.second, date_arr.third
      date + 12.hours
    else
      nil
    end
  end
end
