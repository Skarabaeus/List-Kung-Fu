class ListItemsController < ApplicationController

  before_filter :authenticate_user!
  before_filter :load_list, :except => :index
  before_filter :set_cache_buster

  respond_to :json

  def index

    case params[ :show ]
    when "dashboard"
      @presenter = ListItemIndexPresenters::Dashboard.new( current_user.id )
    else
      @presenter = ListItemIndexPresenters::ListItemView.new( current_user.id, params[ :list_id ], params[ :show ] )
    end

    # don't use etag here, because it might not change (if the same item is edited multiple times)
    if stale?( :last_modified => @presenter.last_updated_utc, :public => true )
      respond_with( DefaultDto.new( :presenter => @presenter ) )
    end
  end

  def show
    @list_item = @list.list_items.find( params[ :id ] )
    if stale?( :etag => @list_item, :last_modified => @list_item.updated_at.utc, :public => true )
      respond_with( DefaultDto.new( :data => @list_item.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] ),
        :template => 'list_items-show' ) )
    end
  end

  def new
    @list_item = ListItem.new
    @list_item.list_id = @list.id

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => 'list_items-form',
        :data => @list_item.to_json( :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] ) ) }
    end
  end

  def edit
    @list_item = @list.list_items.find( params[ :id ] )

    respond_with( DefaultDto.new( :template => 'list_items-form',
      :data => @list_item.to_json( :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] ) ) )
  end

  def create
    @list_item = ListItem.new

    # if we have an id here, that means the
    # user dragged and dropped an existing list item
    # to another list
    existing_id = params[ :list_item ][ :id ]

    @list_item.body = unless existing_id.nil?
      ListItem.find( existing_id ).body
    else
      params[ :list_item ][ :body ]
    end

    @list_item.list_id = @list.id
    @list_item.deadline = get_deadline

    if @list_item.save
      flash[:notice] = 'List Item has been created.'
    end

    respond_to do |format|
      format.js { render :json  => DefaultDto.new( :template => 'list_items-list_item',
        :data => @list_item.to_json( :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ] ) ),
        :status => :created }
    end
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

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :presenter => @presenter ) }
    end
  end

  def destroy
    @list_item = @list.list_items.find( params[ :id ] )
    @list_item.destroy

    respond_to do |format|
      format.js { render :json => DefaultDto.new( :template => '', :data => {} ) }
    end
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
      (params[ :list_item ][ :deadline ]).nil? ? nil : params[ :list_item ][ :deadline ]
    end
  end
end
