class ListItemsController < ApplicationController

  before_filter :load_list
	before_filter :authenticate_user!

  respond_to :xml

  def index
    case params[ :show ]
    when "all"
      @list_items = @list.list_items.order( "created_at desc" )
    when "completed"
      @list_items = @list.list_items.where( "completed = ?", true ).order( "created_at desc" )
    else # uncompleted
      @list_items = @list.list_items.where( "completed = ?", false ).order( "created_at desc" )
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
      Time.zone.now + 1.day
    when 'nextweek'
      Time.zone.now + 1.week
    when 'keepit'
      @list_item.deadline
    else
      nil
    end
  end
end
